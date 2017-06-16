using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using TimelockrBackend.Core;
using TimelockrBackend.Filters;

namespace TimelockrBackend.Controllers
{
    [Route("api")]
    [EnableCors]
    public class MainController : Controller
    {
        private readonly ILogger<MainController> _logger;
        private readonly IAmazonDynamoDB _dynamoDb;

        public MainController(ILogger<MainController> logger, IAmazonDynamoDB dynamoDb)
        {
            _logger = logger;
            _dynamoDb = dynamoDb;
        }

        /// <summary>
        /// Returns an existing event with the time slots selected by every participant so far
        /// </summary>
        [HttpGet("event/{eventId}")]
        public async Task<Event> GetEvent(string eventId)
        {
            var confirmations = await GetConfirmations(eventId);
            if (confirmations.Count == 0 || confirmations[0].Timeslots.Count == 0)
            {
                Response.StatusCode = 404;
                return null;
            }

            var slotComparer = new TimeslotEqualityComparer();
            var ev = new Event
                {
                    EventId = eventId,
                    Email = String.Join(", ", confirmations.OrderBy(x => x.CreatedOn).Select(x => x.Email)),
                    Timeslots = confirmations.Aggregate(confirmations[0].Timeslots,
                                                        (slots, confirmation) => slots
                                                            .Intersect(confirmation.Timeslots, slotComparer).ToList())
                };
            return ev;
        }

        /// <summary>
        /// Submits a confirmation (including initial confirmation that creates an event)
        /// </summary>
        [HttpPost("confirmation")]
        public async Task<Confirmation> SubmitConfirmation()
        {
            var proxyRequest = (APIGatewayProxyRequest)Request.HttpContext.Items["APIGatewayRequest"];
            var confirmation = JsonConvert.DeserializeObject<Confirmation>(proxyRequest.Body);

            if (String.IsNullOrWhiteSpace(confirmation.Email) || confirmation.Timeslots.Count == 0)
                throw new ArgumentException();

            confirmation.Id = Guid.NewGuid().ToString("N");
            if (confirmation.EventId == null)
            {
                // create a new event id for a new event
                bool eventIdExists;
                do
                {
                    confirmation.EventId = GenerateEventId();
                    eventIdExists = (await GetConfirmations(confirmation.EventId, true)).Count > 0;
                } while (eventIdExists);
            }

            // store confirmation
            var dynamoPutRequest = new PutItemRequest
                {
                    TableName = DataStorageConstants.ConfirmationTable,
                    Item = new Dictionary<string, AttributeValue>
                        {
                            {
                                DataStorageConstants.ConfirmationAttributes.Id,
                                new AttributeValue {S = confirmation.Id}
                            },
                            {
                                DataStorageConstants.ConfirmationAttributes.EventId,
                                new AttributeValue {S = confirmation.EventId}
                            },
                            {
                                DataStorageConstants.ConfirmationAttributes.Email,
                                new AttributeValue {S = confirmation.Email}
                            },
                            {
                                DataStorageConstants.ConfirmationAttributes.Timeslots,
                                new AttributeValue
                                    {
                                        SS = new List<string>(
                                            confirmation.Timeslots.Select(JsonConvert.SerializeObject))
                                    }
                            },
                            {
                                DataStorageConstants.ConfirmationAttributes.ClientIp,
                                new AttributeValue {S = proxyRequest.RequestContext.Identity.SourceIp}
                            },
                            {
                                DataStorageConstants.ConfirmationAttributes.CreatedOn,
                                new AttributeValue {S = DateTime.UtcNow.ToString("s")}
                            }
                        }
                };
            await _dynamoDb.PutItemAsync(dynamoPutRequest);

            // TODO: Send email

            return new Confirmation
                {
                    Id = confirmation.Id,
                    EventId = confirmation.EventId
                };
        }

        /// <summary>
        /// Generates a random alpha-numeric string
        /// </summary>
        private static string GenerateEventId()
        {
            return Guid.NewGuid().ToString("N").Substring(0, 8);
        }

        /// <summary>
        /// Retrieves all confirmations for a given event id from the database
        /// </summary>
        private async Task<List<Confirmation>> GetConfirmations(string eventId, bool onlyFirst = false)
        {
            var request = new QueryRequest
                {
                    TableName = DataStorageConstants.ConfirmationTable,
                    IndexName = "IX_EventId",
                    KeyConditionExpression = "#eventId = :v_eventId",
                    ExpressionAttributeNames = new Dictionary<string, string>
                        {
                            {"#eventId", "EventId"}
                        },
                    ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                        {
                            {":v_eventId", new AttributeValue {S = eventId}},
                        }
                };
            var response = await _dynamoDb.QueryAsync(request).ConfigureAwait(false);

            var result = new List<Confirmation>();
            var firstRead = false;
            foreach (var item in response.Items)
            {
                if (onlyFirst && firstRead)
                    break;

                result.Add(new Confirmation
                    {
                        Id = item[DataStorageConstants.ConfirmationAttributes.Id].S,
                        EventId = item[DataStorageConstants.ConfirmationAttributes.EventId].S,
                        Email = item[DataStorageConstants.ConfirmationAttributes.Email].S,
                        Timeslots = item[DataStorageConstants.ConfirmationAttributes.Timeslots].SS
                                                                                               .Select(JsonConvert.DeserializeObject<Timeslot>)
                                                                                               .ToList(),
                        CreatedOn = DateTime.Parse(item[DataStorageConstants.ConfirmationAttributes.CreatedOn].S)
                    });
                firstRead = true;
            }
            return result.OrderByDescending(x => x.CreatedOn).ToList();
        }
    }
}
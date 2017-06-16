using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Amazon.Lambda.APIGatewayEvents;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Moq;
using Newtonsoft.Json;
using TimelockrBackend.Controllers;
using TimelockrBackend.Core;
using Xunit;

namespace TimelockrBackend.Tests
{
    public class MainControllerTests
    {
        private const string EventId = "7a98te6v";
        private const string Email1 = "john@example.com";
        private const string Email2 = "fred@example.com";
        private static readonly DateTime Date1 = new DateTime(2017, 6, 15);
        private const string Time1 = "09:30";
        private static readonly DateTime Date2 = new DateTime(2017, 6, 16);
        private const string Time2 = "15:00";

        private readonly Mock<ILogger<MainController>> _loggerMock;
        private readonly Mock<IAmazonDynamoDB> _dynamoDbMock;

        public MainControllerTests()
        {
            _loggerMock = new Mock<ILogger<MainController>>();

            _dynamoDbMock = new Mock<IAmazonDynamoDB>();
            _dynamoDbMock.Setup(x => x.QueryAsync(
                                    It.Is<QueryRequest>(
                                        r => r.TableName == DataStorageConstants.ConfirmationTable &&
                                             r.IndexName == "IX_EventId"),
                                    It.IsAny<CancellationToken>()))
                         .Returns(Task.FromResult(new QueryResponse
                             {
                                 Items = new List<Dictionary<string, AttributeValue>>
                                     {
                                         new Dictionary<string, AttributeValue>
                                             {
                                                 {
                                                     DataStorageConstants.ConfirmationAttributes.Id,
                                                     new AttributeValue(Guid.NewGuid().ToString("N"))
                                                 },
                                                 {
                                                     DataStorageConstants.ConfirmationAttributes.EventId,
                                                     new AttributeValue(EventId)
                                                 },
                                                 {
                                                     DataStorageConstants.ConfirmationAttributes.Email,
                                                     new AttributeValue(Email1)
                                                 },
                                                 {
                                                     DataStorageConstants.ConfirmationAttributes.Timeslots,
                                                     new AttributeValue(new List<string>
                                                         {
                                                             JsonConvert.SerializeObject(new Timeslot
                                                                 {
                                                                     Date = Date1,
                                                                     Time = Time1
                                                                 }),
                                                             JsonConvert.SerializeObject(new Timeslot
                                                                 {
                                                                     Date = Date2,
                                                                     Time = Time2
                                                                 })
                                                         })
                                                 },
                                                 {
                                                     DataStorageConstants.ConfirmationAttributes.CreatedOn,
                                                     new AttributeValue(Date1.AddDays(-2).ToString("O"))
                                                 }
                                             },
                                         new Dictionary<string, AttributeValue>
                                             {
                                                 {
                                                     DataStorageConstants.ConfirmationAttributes.Id,
                                                     new AttributeValue(Guid.NewGuid().ToString("N"))
                                                 },
                                                 {
                                                     DataStorageConstants.ConfirmationAttributes.EventId,
                                                     new AttributeValue(EventId)
                                                 },
                                                 {
                                                     DataStorageConstants.ConfirmationAttributes.Email,
                                                     new AttributeValue(Email2)
                                                 },
                                                 {
                                                     DataStorageConstants.ConfirmationAttributes.Timeslots,
                                                     new AttributeValue(new List<string>
                                                         {
                                                             JsonConvert.SerializeObject(new Timeslot
                                                                 {
                                                                     Date = Date1,
                                                                     Time = Time1
                                                                 })
                                                         })
                                                 },
                                                 {
                                                     DataStorageConstants.ConfirmationAttributes.CreatedOn,
                                                     new AttributeValue(Date1.AddDays(-1).ToString("O"))
                                                 }
                                             }
                                     }
                             }));
        }

        [Fact]
        public async void GetEvent()
        {
            var controller = new MainController(_loggerMock.Object, _dynamoDbMock.Object);
            var ev = await controller.GetEvent(EventId);
            Assert.NotNull(ev);

            Assert.Equal(EventId, ev.EventId);
            Assert.Contains(Email1, ev.Email);
            Assert.Contains(Email2, ev.Email);
            Assert.Equal(1, ev.Timeslots.Count);
            Assert.Equal(Date1, ev.Timeslots[0].Date);
            Assert.Equal(Time1, ev.Timeslots[0].Time);
        }

        [Fact]
        public async void SubmitConfirmation()
        {
            const string email = "mike@example.com";

            var controller = new MainController(_loggerMock.Object, _dynamoDbMock.Object);
            controller.ControllerContext =
                new ControllerContext(
                    new ActionContext(new DefaultHttpContext(), new RouteData(), new ControllerActionDescriptor()));
            controller.Request.HttpContext.Items["APIGatewayRequest"] = new APIGatewayProxyRequest
                {
                    Body = JsonConvert.SerializeObject(new Confirmation
                        {
                            EventId = EventId,
                            Email = email,
                            Timeslots = new List<Timeslot> {new Timeslot {Date = Date1, Time = Time1}}
                        }),
                    RequestContext = new APIGatewayProxyRequest.ProxyRequestContext
                        {
                            Identity = new APIGatewayProxyRequest.RequestIdentity
                                {
                                    SourceIp = "127.0.0.1"
                                }
                        }
                };

            var confirmation = await controller.SubmitConfirmation();
            Assert.NotNull(confirmation);

            Assert.Equal(EventId, confirmation.EventId);
            Assert.NotNull(confirmation.Id);

            _dynamoDbMock.Verify(x => x.PutItemAsync(
                                     It.Is<PutItemRequest>(
                                         r => r.TableName == DataStorageConstants.ConfirmationTable &&
                                              r.Item[DataStorageConstants.ConfirmationAttributes.EventId].S == EventId &&
                                              r.Item[DataStorageConstants.ConfirmationAttributes.Email].S == email &&
                                              r.Item[DataStorageConstants.ConfirmationAttributes.Timeslots].SS.Count == 1),
                                     It.IsAny<CancellationToken>()));
        }
    }
}
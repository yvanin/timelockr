namespace TimelockrBackend.Core
{
    public static class DataStorageConstants
    {
        public const string ConfirmationTable = "Confirmation";

        public static class ConfirmationAttributes
        {
            public const string Id = "Id";
            public const string EventId = "EventId";
            public const string Email = "Email";
            public const string Timeslots = "Timeslots";
            public const string ClientIp = "ClientIp";
            public const string CreatedOn = "CreatedOn";
        }
    }
}
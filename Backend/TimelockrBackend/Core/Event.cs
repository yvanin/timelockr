using System.Collections.Generic;

namespace TimelockrBackend.Core
{
    public class Event
    {
        public string EventId { get; set; }
        public string Email { get; set; }
        public List<Timeslot> Timeslots { get; set; }
    }
}
using System;

namespace TimelockrBackend.Core
{
    public class Confirmation : Event
    {
        public string Id { get; set; }
        public DateTime? CreatedOn { get; set; }
    }
}
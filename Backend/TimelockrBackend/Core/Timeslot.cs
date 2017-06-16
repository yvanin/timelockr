using System;
using System.Collections.Generic;

namespace TimelockrBackend.Core
{
    public class Timeslot
    {
        public DateTime Date { get; set; }
        public string Time { get; set; }
    }

    public class TimeslotEqualityComparer : IEqualityComparer<Timeslot>
    {
        public bool Equals(Timeslot x, Timeslot y)
        {
            return x.Date == y.Date && x.Time == y.Time;
        }

        public int GetHashCode(Timeslot obj)
        {
            return obj.Date.GetHashCode() + obj.Time.GetHashCode();
        }
    }
}
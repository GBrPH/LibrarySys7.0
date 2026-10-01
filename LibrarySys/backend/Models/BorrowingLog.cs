using System;
using System.ComponentModel.DataAnnotations;

namespace LibrarySys.BackEnd.Models
{
    public class BorrowingLog
    {
        [Key]
        public int Id { get; set; }

        public int BookId { get; set; }
        public string BookTitle { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; }
        public DateTime BorrowDate { get; set; }
        public DateTime DueDate { get; set; } // Add this line
        public DateTime? ReturnDate { get; set; }
        public bool IsOverdue { get; set; }
    }
}

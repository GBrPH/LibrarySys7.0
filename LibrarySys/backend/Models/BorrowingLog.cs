using System;
using System.ComponentModel.DataAnnotations;

namespace LibrarySys.BackEnd.Models
{
    public class BorrowingLog
    {
        [Key]
        public int Id { get; set; }   // Primary key

        public int BookId { get; set; }
        public string BookTitle { get; set; }
        public int UserId { get; set; }
        public string Username { get; set; }    
        public DateTime BorrowDate { get; set; }
        public DateTime? ReturnDate { get; set; }
        public bool IsOverdue { get; set; }
    }
}

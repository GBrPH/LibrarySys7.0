using LibrarySys.BackEnd.DTOs;
using LibrarySys.BackEnd.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace LibrarySys.BackEnd.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class BorrowingLogController : ControllerBase
    {
        private readonly BorrowingLogService _service;

        public BorrowingLogController(BorrowingLogService service)
        {
            _service = service;
        }

        [HttpGet("GetAllLog")]
        [Authorize(Roles = "Librarian,Borrower")]
        public ActionResult<IEnumerable<BorrowingLogDto>> GetAll()
        {
            var logs = _service.GetAll();
            return Ok(logs);
        }

        [HttpGet("LogOfUser/{userId}")]
        [Authorize(Roles = "Librarian,Borrower")]
        public ActionResult<IEnumerable<BorrowingLogDto>> GetHistoryByUser(int userId)
        {
            var history = _service.GetHistoryByUser(userId);
            return Ok(history);
        }
    }
}
using LibrarySys.Dtos;
using LibrarySys.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data;

namespace LibrarySys.Controllers
{
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
        [Authorize(Roles = "Librarian")]
        [Authorize(Roles = "Borrower")]
        public ActionResult<IEnumerable<BorrowingLogDto>> GetAll()
        {
            return Ok(_service.GetAll());
        }

        [HttpGet("LogOfUser/{id}")]
        [Authorize(Roles = "Librarian")]
        [Authorize(Roles = "Borrower")]
        public ActionResult<IEnumerable<BorrowingLogDto>> GetHistoryByUser(int userId)
        {
            var history = _service.GetHistoryByUser(userId);
            return Ok(history);
        }
    }
}
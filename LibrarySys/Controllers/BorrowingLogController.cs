using LibrarySys.Dtos;
using LibrarySys.Services;
using Microsoft.AspNetCore.Mvc;

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
        public ActionResult<IEnumerable<BorrowingLogDto>> GetAll()
        {
            return Ok(_service.GetAll());
        }

        [HttpGet("{userId}/LogOfUser")]
        public ActionResult<IEnumerable<BorrowingLogDto>> GetHistoryByUser(int userId)
        {
            var history = _service.GetHistoryByUser(userId);
            return Ok(history);
        }
    }
}

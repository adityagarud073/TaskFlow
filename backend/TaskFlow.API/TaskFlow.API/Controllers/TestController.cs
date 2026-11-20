using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace TaskFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult GetStatus()
        {
            var response = new
            {
                project = "TaskFlow",
                status = "API is running successfully!",
                time = DateTime.UtcNow
            };

            return Ok(response);
        }
    }
}

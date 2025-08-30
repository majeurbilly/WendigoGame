using Microsoft.AspNetCore.Mvc;

namespace WendigoGame.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TestController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new { 
            message = "🎉 Backend C# connecté avec succès !", 
            timestamp = DateTime.UtcNow,
            status = "running"
        });
    }

    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok(new { 
            message = "🏓 Pong ! Le backend répond !",
            serverTime = DateTime.UtcNow
        });
    }
}

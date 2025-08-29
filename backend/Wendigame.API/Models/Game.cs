using System.ComponentModel.DataAnnotations;

namespace WendigoGame.API.Models;

public class Game
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string Status { get; set; } = "Waiting"; // Waiting, Active, Finished
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? StartedAt { get; set; }
    
    public DateTime? FinishedAt { get; set; }
    
    // Navigation properties
    public ICollection<Player> Players { get; set; } = new List<Player>();
}

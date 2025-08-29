using System.ComponentModel.DataAnnotations;

namespace WendigoGame.API.Models;

public class Player
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string ConnectionId { get; set; } = string.Empty;
    
    public bool IsAlive { get; set; } = true;
    
    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int GameId { get; set; }
    public int RoleId { get; set; }
    
    // Navigation properties
    public Game Game { get; set; } = null!;
    public Role Role { get; set; } = null!;
}

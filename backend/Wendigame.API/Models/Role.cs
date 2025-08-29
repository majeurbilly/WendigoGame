using System.ComponentModel.DataAnnotations;

namespace WendigoGame.API.Models;

public class Role
{
    public int Id { get; set; }
    
    [Required]
    public string Name { get; set; } = string.Empty;
    
    public string Description { get; set; } = string.Empty;
    
    public bool IsWendigo { get; set; } = false;
    
    // Navigation properties
    public ICollection<Player> Players { get; set; } = new List<Player>();
}

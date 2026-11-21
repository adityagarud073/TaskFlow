using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs
{
    public class UpdateTaskStatusDto
    {
        [Required]
        public string Status { get; set; } = "Pending";
    }
}
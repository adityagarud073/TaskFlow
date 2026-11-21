using System.ComponentModel.DataAnnotations;

namespace TaskFlow.API.DTOs
{
    public class UpdateTaskDto
    {
        [Required(ErrorMessage = "Task title is required.")]
        [MaxLength(150)]
        public string Title { get; set; } = string.Empty;

        [MaxLength(1000)]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Priority { get; set; } = "Medium";

        [Required]
        public string Status { get; set; } = "Pending";

        public DateTime? DueDate { get; set; }

        [Required]
        public int UserId { get; set; }
    }
}
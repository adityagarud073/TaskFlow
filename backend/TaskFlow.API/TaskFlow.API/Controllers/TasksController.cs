using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TaskFlow.API.Data;
using TaskFlow.API.DTOs;
using TaskFlow.API.Models;

namespace TaskFlow.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/tasks (Admin ला सर्व Tasks, तर User ला फक्त स्वतःचे Tasks)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskResponseDto>>> GetAllTasks()
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");

            var query = _context.TaskItems.AsNoTracking();

            if (!isAdmin)
            {
                query = query.Where(t => t.UserId == currentUserId);
            }

            var tasks = await query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TaskResponseDto
                {
                    TaskId = t.TaskId,
                    Title = t.Title,
                    Description = t.Description,
                    Priority = t.Priority,
                    Status = t.Status,
                    CreatedAt = t.CreatedAt,
                    DueDate = t.DueDate,
                    UserId = t.UserId
                })
                .ToListAsync();

            return Ok(tasks);
        }

        // 2. GET: api/tasks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<TaskResponseDto>> GetTaskById(int id)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");

            var task = await _context.TaskItems
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.TaskId == id);

            if (task == null)
            {
                return NotFound(new { message = $"Task with ID {id} not found." });
            }

            if (!isAdmin && task.UserId != currentUserId)
            {
                return Forbid();
            }

            return Ok(new TaskResponseDto
            {
                TaskId = task.TaskId,
                Title = task.Title,
                Description = task.Description,
                Priority = task.Priority,
                Status = task.Status,
                CreatedAt = task.CreatedAt,
                DueDate = task.DueDate,
                UserId = task.UserId
            });
        }

        // 3. POST: api/tasks (फक्त Admin)
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TaskResponseDto>> CreateTask(CreateTaskDto dto)
        {
            var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = $"User with ID {dto.UserId} does not exist." });
            }

            var newTask = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                Priority = dto.Priority,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow,
                DueDate = dto.DueDate.HasValue
                    ? DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc)
                    : null,
                UserId = dto.UserId
            };

            _context.TaskItems.Add(newTask);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTaskById), new { id = newTask.TaskId }, new TaskResponseDto
            {
                TaskId = newTask.TaskId,
                Title = newTask.Title,
                Description = newTask.Description,
                Priority = newTask.Priority,
                Status = newTask.Status,
                CreatedAt = newTask.CreatedAt,
                DueDate = newTask.DueDate,
                UserId = newTask.UserId
            });
        }

        // 4. PUT: api/tasks/5 (फक्त Admin)
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<TaskResponseDto>> UpdateTask(int id, UpdateTaskDto dto)
        {
            var existingTask = await _context.TaskItems.FindAsync(id);
            if (existingTask == null)
            {
                return NotFound(new { message = $"Task with ID {id} not found." });
            }

            var userExists = await _context.Users.AnyAsync(u => u.UserId == dto.UserId);
            if (!userExists)
            {
                return BadRequest(new { message = $"User with ID {dto.UserId} does not exist." });
            }

            existingTask.Title = dto.Title;
            existingTask.Description = dto.Description;
            existingTask.Priority = dto.Priority;
            existingTask.Status = dto.Status;
            existingTask.DueDate = dto.DueDate.HasValue
                ? DateTime.SpecifyKind(dto.DueDate.Value, DateTimeKind.Utc)
                : null;
            existingTask.UserId = dto.UserId;

            await _context.SaveChangesAsync();

            return Ok(new TaskResponseDto
            {
                TaskId = existingTask.TaskId,
                Title = existingTask.Title,
                Description = existingTask.Description,
                Priority = existingTask.Priority,
                Status = existingTask.Status,
                CreatedAt = existingTask.CreatedAt,
                DueDate = existingTask.DueDate,
                UserId = existingTask.UserId
            });
        }

        // 5. PATCH: api/tasks/5/status (Admin किंवा ज्याचा Task आहे तो User)
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateTaskStatus(int id, UpdateTaskStatusDto dto)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var isAdmin = User.IsInRole("Admin");

            var task = await _context.TaskItems.FindAsync(id);
            if (task == null)
            {
                return NotFound(new { message = $"Task with ID {id} not found." });
            }

            if (!isAdmin && task.UserId != currentUserId)
            {
                return Forbid();
            }

            task.Status = dto.Status;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Task status updated.", status = task.Status });
        }

        // 6. DELETE: api/tasks/5 (फक्त Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteTask(int id)
        {
            var task = await _context.TaskItems.FindAsync(id);
            if (task == null)
            {
                return NotFound(new { message = $"Task with ID {id} not found." });
            }

            _context.TaskItems.Remove(task);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
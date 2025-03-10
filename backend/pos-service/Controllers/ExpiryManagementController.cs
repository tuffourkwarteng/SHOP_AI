using Microsoft.AspNetCore.Mvc;
using pos_service.Data;
using pos_service.Models;
using System;
using System.Collections.Generic;
using System.Linq;

namespace pos_service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ExpiryManagementController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ExpiryManagementController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: /api/ExpiryManagement/expiring - Get products expiring within a specified number of days
        [HttpGet("expiring")]
        public ActionResult<IEnumerable<Batch>> GetExpiringProducts([FromQuery] int days = 7)
        {
            var expiringProducts = _context.Batches
                .Where(b => b.ExpiryDate >= DateTime.Today && b.ExpiryDate <= DateTime.Today.AddDays(days))
                .ToList();

            return Ok(expiringProducts);
        }

        // ✅ GET: /api/ExpiryManagement/expired - Get expired products
        [HttpGet("expired")]
        public ActionResult<IEnumerable<Batch>> GetExpiredProducts()
        {
            var expiredProducts = _context.Batches
                .Where(b => b.ExpiryDate < DateTime.Today)
                .ToList();

            return Ok(expiredProducts);
        }

        // ✅ POST: /api/ExpiryManagement/alert - Add an expiry alert
        [HttpPost("alert")]
        public ActionResult<ExpiryAlert> AddExpiryAlert([FromBody] ExpiryAlert alert)
        {
            if (alert == null)
            {
                return BadRequest("Invalid alert data.");
            }

            _context.ExpiryAlerts.Add(alert);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetExpiryAlertById), new { id = alert.Id }, alert);
        }

        // ✅ GET: /api/ExpiryManagement/alert/{id} - Get a single expiry alert by ID
        [HttpGet("alert/{id}")]
        public ActionResult<ExpiryAlert> GetExpiryAlertById(int id)
        {
            var alert = _context.ExpiryAlerts.Find(id);
            if (alert == null)
            {
                return NotFound($"Expiry alert with ID {id} not found.");
            }
            return Ok(alert);
        }

        // ✅ PUT: /api/ExpiryManagement/alert/{id} - Update an expiry alert
        [HttpPut("alert/{id}")]
        public IActionResult UpdateExpiryAlert(int id, [FromBody] ExpiryAlert updatedAlert)
        {
            if (updatedAlert == null)
            {
                return BadRequest("Invalid alert data.");
            }

            var alert = _context.ExpiryAlerts.Find(id);
            if (alert == null)
            {
                return NotFound($"Expiry alert with ID {id} not found.");
            }

            // Update fields
            alert.BatchId = updatedAlert.BatchId;
            alert.AlertDate = updatedAlert.AlertDate;
            alert.Status = updatedAlert.Status;

            _context.SaveChanges();
            return Ok(alert);
        }

        // ✅ DELETE: /api/ExpiryManagement/alert/{id} - Delete an expiry alert
        [HttpDelete("alert/{id}")]
        public IActionResult DeleteExpiryAlert(int id)
        {
            var alert = _context.ExpiryAlerts.Find(id);
            if (alert == null)
            {
                return NotFound($"Expiry alert with ID {id} not found.");
            }

            _context.ExpiryAlerts.Remove(alert);
            _context.SaveChanges();
            return Ok(new { message = $"Expiry alert with ID {id} deleted successfully." });
        }
    }
}
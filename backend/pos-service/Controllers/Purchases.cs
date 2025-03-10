
using Microsoft.AspNetCore.Mvc;
using pos_service.Data;
using pos_service.Models;
using System.Collections.Generic;
using System.Linq;

namespace pos_service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PurchaseController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PurchaseController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: /api/Purchase - Get all purchases
        [HttpGet]
        public ActionResult<IEnumerable<Purchase>> GetPurchases()
        {
            return Ok(_context.Purchases.ToList());
        }

        // ✅ GET: /api/Purchase/{id} - Get a single purchase by ID
        [HttpGet("{id}")]
        public ActionResult<Purchase> GetPurchaseById(int id)
        {
            var purchase = _context.Purchases.Find(id);
            if (purchase == null)
            {
                return NotFound($"Purchase with ID {id} not found.");
            }
            return Ok(purchase);
        }

        // ✅ POST: /api/Purchase - Add a new purchase
        [HttpPost]
        public ActionResult<Purchase> AddPurchase([FromBody] Purchase purchase)
        {
            if (purchase == null)
            {
                return BadRequest("Invalid purchase data.");
            }

            _context.Purchases.Add(purchase);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetPurchaseById), new { id = purchase.Id }, purchase);
        }

        // ✅ PUT: /api/Purchase/{id} - Update a purchase
        [HttpPut("{id}")]
        public IActionResult UpdatePurchase(int id, [FromBody] Purchase updatedPurchase)
        {
            if (updatedPurchase == null)
            {
                return BadRequest("Invalid purchase data.");
            }

            var purchase = _context.Purchases.Find(id);
            if (purchase == null)
            {
                return NotFound($"Purchase with ID {id} not found.");
            }

            // Update fields
            purchase.ProductId = updatedPurchase.ProductId;
            purchase.Quantity = updatedPurchase.Quantity;
            purchase.Price = updatedPurchase.Price;
            purchase.Supplier = updatedPurchase.Supplier;
            purchase.PurchaseDate = updatedPurchase.PurchaseDate;

            _context.SaveChanges();
            return Ok(purchase);
        }

        // ✅ DELETE: /api/Purchase/{id} - Delete a purchase
        [HttpDelete("{id}")]
        public IActionResult DeletePurchase(int id)
        {
            var purchase = _context.Purchases.Find(id);
            if (purchase == null)
            {
                return NotFound($"Purchase with ID {id} not found.");
            }

            _context.Purchases.Remove(purchase);
            _context.SaveChanges();
            return Ok(new { message = $"Purchase with ID {id} deleted successfully." });
        }
    }
}
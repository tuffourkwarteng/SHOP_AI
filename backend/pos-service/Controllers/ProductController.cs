using Microsoft.AspNetCore.Mvc;
using pos_service.Data;
using pos_service.Models;
using System.Collections.Generic;
using System.Linq;

namespace pos_service.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductController(AppDbContext context)
        {
            _context = context;
        }

        // ✅ GET: /api/Product - Get all products
        [HttpGet]
        public ActionResult<IEnumerable<Product>> GetProducts()
        {
            return Ok(_context.Products.ToList());
        }

        // ✅ GET: /api/Product/{id} - Get a single product by ID
        [HttpGet("{id}")]
        public ActionResult<Product> GetProductById(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound($"Product with ID {id} not found.");
            }
            return Ok(product);
        }

        // ✅ POST: /api/Product - Add a new product
        [HttpPost]
        public ActionResult<Product> AddProduct([FromBody] Product product)
        {
            if (product == null)
            {
                return BadRequest("Invalid product data.");
            }

            _context.Products.Add(product);
            _context.SaveChanges();

            return CreatedAtAction(nameof(GetProductById), new { id = product.Id }, product);
        }

        // ✅ PUT: /api/Product/{id} - Update a product
        [HttpPut("{id}")]
        public IActionResult UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            if (updatedProduct == null)
            {
                return BadRequest("Invalid product data.");
            }

            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            // Update fields
            product.Name = updatedProduct.Name;
            product.Price = updatedProduct.Price;
            product.Stock = updatedProduct.Stock;
            product.CategoryId = updatedProduct.CategoryId;

            _context.SaveChanges();
            return Ok(product);
        }

        // ✅ DELETE: /api/Product/{id} - Delete a product
        [HttpDelete("{id}")]
        public IActionResult DeleteProduct(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound($"Product with ID {id} not found.");
            }

            _context.Products.Remove(product);
            _context.SaveChanges();
            return Ok(new { message = $"Product with ID {id} deleted successfully." });
        }
    }
}

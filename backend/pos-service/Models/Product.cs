using System.Text.Json.Serialization;

namespace pos_service.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int CategoryId { get; set; }

        [JsonIgnore] // This prevents Swagger from including "category" in the request
        public Category? Category { get; set; }  // Make Category nullable
    }
}

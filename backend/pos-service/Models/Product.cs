using System;
using System.Text.Json.Serialization;

namespace pos_service.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string? ProductCode { get; set; } // Nullable
        public string? Name { get; set; } // Nullable
        public decimal Price { get; set; }
        public int Stock { get; set; }
        public int CategoryId { get; set; }
        public DateTime DateAdded { get; set; } // Not nullable
        public string? AddedBy { get; set; } // Nullable

        [JsonIgnore]
        public Category? Category { get; set; }  // Nullable
    }
}
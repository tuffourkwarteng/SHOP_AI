using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace pos_service.Models
{
    public class Sale
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public DateTime SaleDate { get; set; } = DateTime.UtcNow; // Auto-set date

        [Required]
        public decimal TotalAmount { get; set; }

        [Required]
        [EmailAddress]
        public string CustomerEmail { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string CustomerPhone { get; set; } = string.Empty;

        // Navigation Property
        public List<SaleItem> SaleItems { get; set; } = new List<SaleItem>();
    }

    public class SaleItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Sale")]
        public int SaleId { get; set; }

        [Required]
        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public decimal Price { get; set; } // Unit price at the time of sale

        // Navigation Properties
        [JsonIgnore]
        public Sale Sale { get; set; }

        [JsonIgnore]
        public Product Product { get; set; }
    }
}

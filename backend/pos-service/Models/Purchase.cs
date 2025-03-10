namespace pos_service.Models
{
    public class Purchase
    {
        public int Id { get; set; }
        public int ProductId { get; set; } // Foreign key to Product
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public string Supplier { get; set; }
        public DateTime PurchaseDate { get; set; }
    }
}
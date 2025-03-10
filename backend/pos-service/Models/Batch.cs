namespace pos_service.Models
{
    public class Batch
    {
        public int Id { get; set; }
        public int ProductId { get; set; } // Foreign key to Product
        public string BatchNumber { get; set; }
        public int Quantity { get; set; }
        public DateTime ExpiryDate { get; set; }
        public DateTime DateReceived { get; set; }
    }
}
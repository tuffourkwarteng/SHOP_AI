namespace pos_service.Models
{
    public class ExpiryAlert
    {
        public int Id { get; set; }
        public int BatchId { get; set; } // Foreign key to Batch
        public DateTime AlertDate { get; set; }
        public string Status { get; set; } // e.g., "Pending", "Resolved"
    }
}
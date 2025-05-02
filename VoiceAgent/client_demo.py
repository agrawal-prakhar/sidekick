import os
from dotenv import load_dotenv
from vapi_ai import Vapi

# Load environment variables
load_dotenv()

def initialize_vapi():
    """Initialize VAPI client with API key"""
    api_key = os.getenv("VAPI_API_KEY")
    if not api_key:
        raise ValueError("VAPI_API_KEY not found in environment variables")
    
    # Initialize VAPI client
    client = Vapi(api_key=api_key)
    return client

def main():
    try:
        # Initialize VAPI client
        client = initialize_vapi()
        print("VAPI client initialized successfully")
        
        # Example call creation
        call = client.call.create(
            assistant_id=os.getenv("ASSISTANT_ID"),
            phone_number="+1XXXYYYZZZZ",  # Replace with actual phone number
            from_phone_number_id=os.getenv("VAPI_NUMBER_ID")
        )
        print("Dialling, call id:", call.id)
        
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    main()
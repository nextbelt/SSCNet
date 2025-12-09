import httpx
import asyncio

async def register_users():
    async with httpx.AsyncClient() as client:
        # Register Buyer
        try:
            response = await client.post(
                "http://127.0.0.1:8000/api/v1/auth/register",
                json={
                    "email": "admin@example.com",
                    "password": "password123",
                    "full_name": "Admin Buyer",
                    "user_type": "buyer",
                    "company_name": "Global Sourcing Inc."
                }
            )
            if response.status_code == 201:
                print("Created buyer: admin@example.com / password123")
            elif response.status_code == 400 and "already registered" in response.text:
                print("Buyer already exists: admin@example.com")
            else:
                print(f"Failed to create buyer: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error creating buyer: {e}")

        # Register Supplier
        try:
            response = await client.post(
                "http://127.0.0.1:8000/api/v1/auth/register",
                json={
                    "email": "supplier@example.com",
                    "password": "password123",
                    "full_name": "John Supplier",
                    "user_type": "supplier",
                    "company_name": "Quality Components Ltd."
                }
            )
            if response.status_code == 201:
                print("Created supplier: supplier@example.com / password123")
            elif response.status_code == 400 and "already registered" in response.text:
                print("Supplier already exists: supplier@example.com")
            else:
                print(f"Failed to create supplier: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error creating supplier: {e}")

if __name__ == "__main__":
    asyncio.run(register_users())

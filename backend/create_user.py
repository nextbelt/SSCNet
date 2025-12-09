import sys
import os
from datetime import datetime

# Add the backend directory to the python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, create_tables
from app.models.user import User, Company, POC
from app.core.security import get_password_hash

def create_users():
    db = SessionLocal()
    try:
        # Create Buyer (Admin)
        buyer_email = "admin@example.com"
        buyer = db.query(User).filter(User.email == buyer_email).first()
        if not buyer:
            print(f"Creating buyer: {buyer_email}")
            buyer = User(
                email=buyer_email,
                name="Admin Buyer",
                hashed_password=get_password_hash("password123"),
                is_active=True,
                is_verified=True,
                verification_status="verified",
                created_at=datetime.utcnow()
            )
            db.add(buyer)
            db.flush()
            
            # Create Company for Buyer
            company = Company(
                name="Global Sourcing Inc.",
                is_verified=True,
                verification_source="manual",
                created_at=datetime.utcnow()
            )
            db.add(company)
            db.flush()
            
            # Create POC
            poc = POC(
                user_id=buyer.id,
                company_id=company.id,
                role="Procurement Manager",
                is_primary=True,
                availability_status="available"
            )
            db.add(poc)
            db.commit()
            print(f"Created buyer: {buyer_email} / password123")
        else:
            print(f"Buyer already exists: {buyer_email}")

        # Create Supplier
        supplier_email = "supplier@example.com"
        supplier = db.query(User).filter(User.email == supplier_email).first()
        if not supplier:
            print(f"Creating supplier: {supplier_email}")
            supplier = User(
                email=supplier_email,
                name="John Supplier",
                hashed_password=get_password_hash("password123"),
                is_active=True,
                is_verified=True,
                verification_status="verified",
                created_at=datetime.utcnow()
            )
            db.add(supplier)
            db.flush()
            
            # Create Company for Supplier
            company = Company(
                name="Quality Components Ltd.",
                is_verified=True,
                verification_source="manual",
                created_at=datetime.utcnow(),
                company_type="manufacturer",
                industry="Electronics"
            )
            db.add(company)
            db.flush()
            
            # Create POC
            poc = POC(
                user_id=supplier.id,
                company_id=company.id,
                role="Sales Manager",
                is_primary=True,
                availability_status="available"
            )
            db.add(poc)
            db.commit()
            print(f"Created supplier: {supplier_email} / password123")
        else:
            print(f"Supplier already exists: {supplier_email}")
            
    except Exception as e:
        print(f"Error creating users: {e}")
        db.rollback()
    finally:
        db.close()
        sys.stdout.flush()

if __name__ == "__main__":
    print("Starting user creation...")
    sys.stdout.flush()
    create_tables()
    print("Tables created.")
    sys.stdout.flush()
    create_users()
    print("Done.")
    sys.stdout.flush()

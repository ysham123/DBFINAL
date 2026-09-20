-- Home Cleaning Services Database Schema
-- E-R Diagram Assumptions:
-- 1. Each Client can submit multiple ServiceRequests
-- 2. Each ServiceRequest can have multiple Photos (max 5)
-- 3. Each ServiceRequest can have multiple Quotes (negotiation history)
-- 4. An accepted Quote creates one Order
-- 5. Each Order has one Bill (which can be revised multiple times)
-- 6. Each Bill can have multiple BillRevisions for dispute tracking

-- Run only against an empty database. Existing tables are never dropped.

-- Clients table
CREATE TABLE Clients (
    client_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    credit_card_last4 VARCHAR(4),  -- Store only last 4 digits for security
    credit_card_type VARCHAR(50),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ServiceRequests table
CREATE TABLE ServiceRequests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    service_address VARCHAR(255) NOT NULL,
    cleaning_type ENUM('basic', 'deep cleaning', 'move-out') NOT NULL,
    num_rooms INT NOT NULL CHECK (num_rooms > 0),
    preferred_datetime DATETIME NOT NULL,
    proposed_budget DECIMAL(10, 2) NOT NULL CHECK (proposed_budget >= 0),
    special_notes TEXT,
    status ENUM('pending', 'quoted', 'negotiating', 'accepted', 'rejected', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Clients(client_id) ON DELETE CASCADE,
    INDEX idx_client (client_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- RequestPhotos table (max 5 photos per request)
CREATE TABLE RequestPhotos (
    photo_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    photo_url VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES ServiceRequests(request_id) ON DELETE CASCADE,
    INDEX idx_request (request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Quotes table (stores all quote responses, including negotiation history)
CREATE TABLE Quotes (
    quote_id INT AUTO_INCREMENT PRIMARY KEY,
    request_id INT NOT NULL,
    quoted_price DECIMAL(10, 2) NOT NULL CHECK (quoted_price >= 0),
    scheduled_datetime DATETIME NOT NULL,
    anna_notes TEXT,
    client_response ENUM('pending', 'accepted', 'countered', 'rejected') DEFAULT 'pending',
    client_counter_note TEXT,
    is_final_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES ServiceRequests(request_id) ON DELETE CASCADE,
    INDEX idx_request (request_id),
    INDEX idx_accepted (is_final_accepted),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Orders table (created when quote is accepted)
CREATE TABLE Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    quote_id INT NOT NULL UNIQUE,
    request_id INT NOT NULL,
    client_id INT NOT NULL,
    final_price DECIMAL(10, 2) NOT NULL CHECK (final_price >= 0),
    scheduled_datetime DATETIME NOT NULL,
    completion_status ENUM('scheduled', 'in_progress', 'completed', 'cancelled') DEFAULT 'scheduled',
    completed_at DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_id) REFERENCES Quotes(quote_id) ON DELETE CASCADE,
    FOREIGN KEY (request_id) REFERENCES ServiceRequests(request_id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES Clients(client_id) ON DELETE CASCADE,
    INDEX idx_client (client_id),
    INDEX idx_status (completion_status),
    INDEX idx_completed_at (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Bills table
CREATE TABLE Bills (
    bill_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    bill_status ENUM('pending', 'paid', 'disputed', 'revised') DEFAULT 'pending',
    dispute_note TEXT,
    payment_datetime DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_status (bill_status),
    INDEX idx_created_at (created_at),
    INDEX idx_payment (payment_datetime)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- BillRevisions table (stores all bill revision history for dispute evidence)
CREATE TABLE BillRevisions (
    revision_id INT AUTO_INCREMENT PRIMARY KEY,
    bill_id INT NOT NULL,
    revised_amount DECIMAL(10, 2) NOT NULL CHECK (revised_amount >= 0),
    revision_note TEXT,
    revised_by ENUM('anna', 'client') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bill_id) REFERENCES Bills(bill_id) ON DELETE CASCADE,
    INDEX idx_bill (bill_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- setup-database.js creates the configured administrator after loading the schema.

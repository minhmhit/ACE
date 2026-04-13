-- Migration: Add address_id column to orders table
-- This allows linking orders to saved addresses from the addresses table

ALTER TABLE `orders` 
ADD COLUMN `address_id` INT(11) DEFAULT NULL AFTER `shipAddress`,
ADD CONSTRAINT `fk_orders_addresses` 
  FOREIGN KEY (`address_id`) 
  REFERENCES `addresses` (`id`) 
  ON DELETE SET NULL 
  ON UPDATE CASCADE;

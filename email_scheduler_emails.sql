-- MySQL dump 10.13  Distrib 8.0.45, for Win64 (x86_64)
--
-- Host: localhost    Database: email_scheduler
-- ------------------------------------------------------
-- Server version	9.6.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ '2d6bb3ca-191d-11f1-9a3e-002b6763cd1d:1-283';

--
-- Table structure for table `emails`
--

DROP TABLE IF EXISTS `emails`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `emails` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `body` text NOT NULL,
  `scheduled_at` datetime(3) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'SCHEDULED',
  `job_id` varchar(255) DEFAULT NULL,
  `sent_at` datetime(3) DEFAULT NULL,
  `last_error` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_job_id` (`job_id`),
  KEY `idx_email_status` (`status`),
  KEY `idx_scheduled_at` (`scheduled_at`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `emails`
--

LOCK TABLES `emails` WRITE;
/*!40000 ALTER TABLE `emails` DISABLE KEYS */;
INSERT INTO `emails` VALUES (2,'test@gmail.com','First Scheduled Email','Hello! This is my first email scheduler project.','2026-11-10 05:00:00.000','SCHEDULED',NULL,NULL,NULL,'2026-11-08 19:15:51','2026-11-08 19:15:51'),(3,'venu@gmail.com','Updated Scheduled Email','This is my updated email.','2026-11-11 06:00:00.000','SCHEDULED',NULL,NULL,NULL,'2026-11-08 19:18:58','2026-11-08 19:18:58'),(4,'test.user@example.com','Project Status Update & Next Steps','Hello Venu, this is a test email scheduled via your BullMQ backend queue system.','2026-11-08 21:30:00.000','SCHEDULED','email-4',NULL,NULL,'2026-11-08 20:51:06','2026-11-08 20:51:06'),(5,'testvenuits1st@gmail.com','Phase 4 Email Testing','Congratulations! Your Email Scheduler is working.','2027-11-10 02:00:00.000','SCHEDULED','email-5',NULL,NULL,'2026-11-10 02:04:08','2026-11-10 02:04:08'),(6,'testvenuits1st@gmail.com','Phase 4 Email Testing','Congratulations! Your Email Scheduler is working.','2027-11-10 02:00:00.000','CANCELLED','email-6',NULL,NULL,'2026-11-10 02:04:17','2026-11-10 04:22:01'),(7,'test.user.venu2nd.test@example.com','Project Status Update & Next Steps','Hello Venu, this is a test email scheduled via your BullMQ backend queue system.','2026-11-10 02:15:00.000','SENT','email-7','2026-11-10 02:15:03.159',NULL,'2026-11-10 02:07:13','2026-11-10 02:15:03'),(8,'test.user@example.com','Phase 4 BullMQ & Nodemailer Test','Hello! Testing end-to-end email scheduling flow.','2026-11-10 02:30:00.000','SENT','email-8','2026-11-10 02:30:03.274',NULL,'2026-11-10 02:09:12','2026-11-10 02:30:03'),(9,'client.project@example.com','Weekly Performance Report & Analytics','Hello Team,\n\nHere is the scheduled automated report generated via the BullMQ email scheduler.\n\nBest regards,\nAutomated System','2026-11-10 03:00:00.000','SENT','email-9','2026-11-10 03:00:02.748',NULL,'2026-11-10 02:12:52','2026-11-10 03:00:02'),(10,'vvenugr1234@gmail.com','Hello How r u','I m glate to see u','2026-11-10 02:50:00.000','SENT','email-10','2026-11-10 02:50:02.949',NULL,'2026-11-10 02:47:52','2026-11-10 02:50:02'),(11,'vvenugr1234@gmail.com','Help to solve PRoblem','Ms to  write smth where every one can do','2026-11-10 02:51:00.000','SENT','email-11','2026-11-10 02:51:02.803',NULL,'2026-11-10 02:50:19','2026-11-10 02:51:02');
/*!40000 ALTER TABLE `emails` ENABLE KEYS */;
UNLOCK TABLES;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-11-10 10:50:39

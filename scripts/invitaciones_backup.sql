-- MySQL dump 10.13  Distrib 8.0.46, for Linux (x86_64)
--
-- Host: localhost    Database: invitaciones
-- ------------------------------------------------------
-- Server version	8.0.46

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `card_templates`
--

DROP TABLE IF EXISTS `card_templates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `card_templates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `front_config` longtext DEFAULT (_utf8mb4'{}'),
  `back_config` longtext DEFAULT (_utf8mb4'{}'),
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_id` (`event_id`),
  CONSTRAINT `card_templates_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `card_templates`
--

LOCK TABLES `card_templates` WRITE;
/*!40000 ALTER TABLE `card_templates` DISABLE KEYS */;
INSERT INTO `card_templates` VALUES (1,1,'{\"bgColor\":\"#b448db\",\"textColor\":\"#333333\",\"borderColor\":\"#d4a017\",\"bgImage\":\"http://localhost/uploads/images/1779129710985-810507547.jpg\",\"footerText\":\"¡Te esperamos!\"}','{\"bgColor\":\"#d9a6a6\",\"borderColor\":\"#4e3e18\",\"topText\":\"Escanea para ver tu invitación\"}','2026-05-18 18:43:14');
/*!40000 ALTER TABLE `card_templates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `event_config`
--

DROP TABLE IF EXISTS `event_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_config` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `config_json` longtext NOT NULL DEFAULT (_utf8mb4'{}'),
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_id` (`event_id`),
  CONSTRAINT `event_config_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `event_config`
--

LOCK TABLES `event_config` WRITE;
/*!40000 ALTER TABLE `event_config` DISABLE KEYS */;
INSERT INTO `event_config` VALUES (1,1,'{\"intro\":{\"enabled\":true,\"background\":\"http://localhost/uploads/gifs/1779129864766-480054539.gif\",\"phrase\":\"La noche esta por comenzar ...\",\"duration\":5,\"phraseStyle\":{\"fontFamily\":\"cinzel\",\"fontSize\":40,\"color\":\"#a76fec\",\"fontWeight\":500}},\"hero\":{\"backgroundGif\":\"http://localhost/uploads/gifs/1779129889608-279988521.gif\",\"audioUrl\":\"http://localhost/uploads/audio/1779129899199-244351508.mp3\",\"eventDescription\":\"XV Años\",\"celebrantNames\":\"Valeria\",\"heroPhrase\":\"\",\"countdownDate\":\"2026-11-24T19:00\",\"eventDescriptionStyle\":{\"fontFamily\":\"cormorant\",\"fontSize\":34,\"color1\":\"#ffffff\",\"color2\":\"#e192f7\",\"gradientAngle\":168,\"gradientIntensity\":100,\"fontWeight\":800,\"color\":\"#f8e1fe\"},\"celebrantNamesStyle\":{\"fontFamily\":\"spumoni\",\"fontSize\":120,\"color1\":\"#ffdf8f\",\"color2\":\"#e192f7\",\"gradientAngle\":360,\"gradientIntensity\":86,\"fontWeight\":400},\"heroPhraseStyle\":{\"fontFamily\":\"serif\",\"fontSize\":18,\"color\":\"#d5b47b\"}},\"invitation\":{\"title\":\"Están cordialmente invitados\",\"subtitle\":\"Una noche mágica inspirada en un cuento\"},\"details\":{\"enabled\":true,\"title\":\"Detalles del Evento\",\"cards\":[{\"id\":\"1\",\"icon\":\"favorite\",\"title\":\"Padres\",\"content\":\"Rogelio \\ny \\nKarla\",\"textAlign\":\"center\",\"fontSize\":14},{\"id\":\"2\",\"icon\":\"stars\",\"title\":\"Padrinos\",\"content\":\"Irving Pavía\\nAnizaret Alvarez\",\"textAlign\":\"center\",\"fontSize\":14}]},\"venues\":{\"enabled\":true,\"items\":[{\"id\":\"1779145696289\",\"title\":\"Ceremonia Religiosa\",\"icon\":\"http://localhost/uploads/images/1779145725063-984754773.png\",\"name\":\"Parroquia - El Buen Pastor\",\"address\":\"Calle 24 No. 218-x 29, San Pedro Cholul, 97138 Mérida, Yuc.\",\"time\":\"19:00\",\"mapsUrl\":\"https://maps.app.goo.gl/LnMTbYQxUGtt8hhE7\"},{\"id\":\"1779145886216\",\"title\":\"Fiesta\",\"icon\":\"http://localhost/uploads/images/1779145919812-506047784.png\",\"name\":\"GRAND VERSALLES\",\"address\":\"Av Quetzalcoatl #230, EL VERGEL, 97176 Mérida, Yuc.\",\"time\":\"20:30\",\"mapsUrl\":\"https://maps.app.goo.gl/xyMR7Lp6LeUapSoy6\"}]},\"itinerary\":{\"enabled\":true,\"title\":\"Itinerario\",\"items\":[]},\"gallery\":{\"enabled\":true,\"title\":\"Galería\",\"description\":\"Una noche mágica inspirada en un cuento\"},\"dresscode\":{\"enabled\":true,\"title\":\"Código de Vestimenta\",\"description\":\"Formal, Formal Casual.\"},\"gifts\":{\"enabled\":true,\"title\":\"Mesa de Regalos\",\"description\":\"Si quieres puedes ser parte de mi gran mesa de regalos ...\",\"link\":\"https://www.amazon.com.mx/baby-reg/ingrid-pavia-julio-2025-merida/1CEOH16UNJ9N6\",\"buttonText\":\"Ver Lista\",\"transfer\":{\"enabled\":true,\"title\":\"¿Prefieres hacer una transferencia?\",\"description\":\"Si prefieres dejarme un regalo por este medio ...\",\"accountName\":\"Juan Perez\",\"bank\":\"BBVA\",\"accountType\":\"tarjeta\",\"accountNumber\":\"4545454545454545\",\"animation\":\"none\"}},\"rsvp\":{\"enabled\":true,\"title\":\"Confirmar Asistencia\"},\"theme\":{\"cardBg\":\"rgba(236,194,255,0.31)\",\"cardBorder\":\"#e70808\",\"textPrimary\":\"#0008ff\",\"textSecondary\":\"#ffffff\",\"navFooterText\":\"#f1b4fe\",\"buttonBg\":\"#e9b2f5\",\"buttonText\":\"#1d0029\"},\"globalStyles\":{\"sectionHeadingStyle\":{\"fontFamily\":\"dancing\",\"fontSize\":36,\"color\":\"#9f7eed\"},\"titleStyle\":{\"fontFamily\":\"sacramento\",\"fontSize\":48,\"color\":\"#dd53f9\",\"color2\":\"#f0c040\",\"gradientAngle\":180,\"gradientIntensity\":80,\"fontWeight\":800},\"subtitleStyle\":{\"fontFamily\":\"cinzel\",\"fontSize\":25,\"color\":\"#ffffff\"},\"contentStyle\":{\"fontFamily\":\"serif\",\"fontSize\":18,\"color\":\"#ffffff\"},\"separatorStyle\":{\"type\":\"animated\",\"color\":\"#b87ff0\"}}}','2026-05-20 16:06:40');
/*!40000 ALTER TABLE `event_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `events` (
  `id` int NOT NULL AUTO_INCREMENT,
  `slug` varchar(200) NOT NULL,
  `name` varchar(255) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `event_date` datetime NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES (1,'xv-valeria','XV Años Valeria','XV Años','2026-11-24 19:00:00',1,'2026-05-18 18:39:28');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `guests`
--

DROP TABLE IF EXISTS `guests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `guests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `unique_code` varchar(50) NOT NULL,
  `guest_type` enum('individual','family') NOT NULL DEFAULT 'individual',
  `family_name` varchar(255) DEFAULT NULL,
  `guest_names` text NOT NULL,
  `max_companions` int DEFAULT '0',
  `confirmed` tinyint(1) DEFAULT '0',
  `confirmed_names` text,
  `confirmed_count` int DEFAULT '0',
  `confirmed_at` datetime DEFAULT NULL,
  `notes` text,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_code` (`unique_code`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `guests_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `guests`
--

LOCK TABLES `guests` WRITE;
/*!40000 ALTER TABLE `guests` DISABLE KEYS */;
INSERT INTO `guests` VALUES (1,1,'6E558E0B','family','Familia García','Juan García, María García',0,1,'Juan García, María García',2,'2026-05-19 19:10:25','','2026-05-18 18:40:38'),(2,1,'32DD926E','individual','','Pedro López',2,0,NULL,0,NULL,'Mesa VIP','2026-05-18 18:40:38');
/*!40000 ALTER TABLE `guests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `itinerary`
--

DROP TABLE IF EXISTS `itinerary`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `itinerary` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `icon` varchar(100) DEFAULT 'event',
  `time` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `itinerary_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `itinerary`
--

LOCK TABLES `itinerary` WRITE;
/*!40000 ALTER TABLE `itinerary` DISABLE KEYS */;
INSERT INTO `itinerary` VALUES (1,1,'⛪','7:00 pm','Iglesia','Igresia',0),(2,1,'👑','8:00 pm','Fiesta','Fiesta',1);
/*!40000 ALTER TABLE `itinerary` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `photos`
--

DROP TABLE IF EXISTS `photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `photos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `event_id` int NOT NULL,
  `filename` varchar(500) NOT NULL,
  `url` varchar(1000) NOT NULL,
  `sort_order` int DEFAULT '0',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `event_id` (`event_id`),
  CONSTRAINT `photos_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `photos`
--

LOCK TABLES `photos` WRITE;
/*!40000 ALTER TABLE `photos` DISABLE KEYS */;
INSERT INTO `photos` VALUES (1,1,'images/1779137260041-885511262.jpg','http://localhost/uploads/images/1779137260041-885511262.jpg',0,'2026-05-18 20:47:40'),(2,1,'images/1779137260052-616497756.png','http://localhost/uploads/images/1779137260052-616497756.png',1,'2026-05-18 20:47:40');
/*!40000 ALTER TABLE `photos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'admin',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'admin','$2a$10$cE6H1olucN20K1UV/t8d5eNDvbTwv3dBK99dt/ylCG4CeeYstaUQO','admin','2026-05-18 18:24:46');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'invitaciones'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-20 16:24:36

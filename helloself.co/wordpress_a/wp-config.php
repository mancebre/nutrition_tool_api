<?php
/** 
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information by
 * visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'wordpress_830');

/** MySQL database username */
define('DB_USER', 'wordpress_3e');

/** MySQL database password */
define('DB_PASSWORD', '9V3Ar$fjF7');

/** MySQL hostname */
define('DB_HOST', '50.62.209.72:3306');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/**#@+
 * Authentication Unique Keys.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link http://api.wordpress.org/secret-key/1.1/ WordPress.org secret-key service}
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         '3isAzY@etlOAZ%doRGP)8l!uOQYXnQ!dD(V6$efRNEwIOVFGIfctvRwZkd6k^^z#');
define('SECURE_AUTH_KEY',  'csN!qLPKER*HHqjVAWHe9tVrcCKi3oOieE987B@D4jfDARcBP7qRD^r2vtZKoa(T');
define('LOGGED_IN_KEY',    'z*6rs@&SX1gV7I7SHv@rPQJj%5dPuAU#JDjMw71@4Y0C(lPV85c(SWc#g)B&MJAB');
define('NONCE_KEY',        'nM^LByMnn(nrK%0mY&aXTg%$^si1Bvm@miNRPihICyEP0AuZTAVzhH4KJzUHY))v');
define('AUTH_SALT',        '(^XA$^V#@lMjf5MvNQ$eBvmhl&Z6rRTmDR1@@WTr^*2A)Euu8IDIX@Q#^%)tS0Dq');
define('SECURE_AUTH_SALT', 'FdgG^vVomJpjkt*W8W8QO0b3eSRglZiADOZJcIffcMds&NXVbkYI9RJd@9raXXO!');
define('LOGGED_IN_SALT',   'B@Bt0k50i2ac3yTwe!L8o5fUhhOTBHrST9s(9pl#p*Zk!GkFxcDMkvG3cVWQY5rc');
define('NONCE_SALT',       'C4BftFl$gF!aKiGy9XdHg6c9e&TkZ0vOpU$2yGv76q2U&D24vO1)#0&sttbv5T%P');
/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress.  A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de.mo to wp-content/languages and set WPLANG to 'de' to enable German
 * language support.
 */
define ('WPLANG', 'en_US');

define ('FS_METHOD', 'direct');

define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** WordPress absolute path to the Wordpress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');

//--- disable auto upgrade
define( 'AUTOMATIC_UPDATER_DISABLED', true );



?>

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
define('DB_NAME', 'wordpress_026');

/** MySQL database username */
define('DB_USER', 'wordpress_d3');

/** MySQL database password */
define('DB_PASSWORD', 'XMOa1i07#v');

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
define('AUTH_KEY',         '(V$^AebjrQuArPvHdCc9aDDOob0x04im36koFqEl3dd8Zrq6mc5cO@x61DCUwhkM');
define('SECURE_AUTH_KEY',  ')Lo(1sMq2yM&vmO*ccFhv@TH!lBUnF8Ns37SN&()FYs1#JLw@lC)4Ji&UI)MNlWs');
define('LOGGED_IN_KEY',    '5eXK%(BD#y!KK)%@uz65#o*8ZKz5O28KdHFqKhlsbLAxVC5h@u@E6!GZ1JAW3$Mp');
define('NONCE_KEY',        'D$RLBMJWb2i90XAAd2f)9MiB1jelS0fjANDmiJ#6)j8HZE80Z@igLs530ojGAMEJ');
define('AUTH_SALT',        'au2@o&fIidP6pgaZCwni^$JjI9VTLWMde6JiJ1iLmjA^FAyW8EX6Az&x2mURRWHG');
define('SECURE_AUTH_SALT', 'lXF)DyItcspDm1NPrQEOhANwL3qQJm*y*@1m$SxcvPwWqD1Lz21m5EH&5)maF*Xp');
define('LOGGED_IN_SALT',   'k$v4FTt9(jEPO^97Jtz05nbx&ncsUjc7E9!BQkkH(8whDiS&!E7s*$C475hOLN9a');
define('NONCE_SALT',       'UGHJBGB$T@lG%k)KtFtrgJ@hFamCZGLYoIWgH0ucXy@c(C)hSOj45GCcz(4MS4lc');
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

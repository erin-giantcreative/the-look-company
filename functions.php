<?php

add_action( 'wp_enqueue_scripts', 'salient_child_enqueue_styles', 100);

function salient_child_enqueue_styles() {
  $nectar_theme_version = nectar_get_theme_version();
  wp_enqueue_style( 'salient-child-style', get_stylesheet_directory_uri() . '/style.css', '', $nectar_theme_version );
  wp_enqueue_style( 'theme-custom-style', get_stylesheet_directory_uri() . '/assets/css/style.min.css', '', $nectar_theme_version );
  wp_register_script( 'salient-custom-js', get_stylesheet_directory_uri() . '/custom.js', array('jquery'),'',true  );
  wp_register_script( 'tlc-form-js', get_stylesheet_directory_uri() . '/assets/js/forms.js', array('jquery'),'',true  );
  //wp_enqueue_script( 'salient-custom-js' );
  if ( is_front_page() ) {
    wp_enqueue_style( 'tlc-homepage-style', get_stylesheet_directory_uri() . '/assets/css/home.min.css', '', $nectar_theme_version );
  }
  if ( is_page('contact') ) {
    wp_enqueue_style( 'tlc-contact-style', get_stylesheet_directory_uri() . '/assets/css/contact.min.css', '', $nectar_theme_version );
    wp_enqueue_script( 'tlc-form-js' );
  }
  if ( is_page('our-companies') ) {
    wp_enqueue_style( 'tlc-our-companies-style', get_stylesheet_directory_uri() . '/assets/css/our-companies.min.css', '', $nectar_theme_version );
  }
  if ( is_page('retail-solutions') ) {
    wp_enqueue_style( 'tlc-retail-solutions-style', get_stylesheet_directory_uri() . '/assets/css/retail-solutions.min.css', '', $nectar_theme_version );
  }
  if ( is_page('sports-and-events') ) {
    wp_enqueue_style( 'tlc-sports-and-events-style', get_stylesheet_directory_uri() . '/assets/css/sports-and-events.min.css', '', $nectar_theme_version );
  }
  if ( is_page('meet-our-team') ) {
    wp_enqueue_style( 'tlc-meet-our-team-style', get_stylesheet_directory_uri() . '/assets/css/meet-our-team.min.css', '', $nectar_theme_version );
  }
  if ( is_page('faq') ) {
    wp_enqueue_style( 'tlc-faq-style', get_stylesheet_directory_uri() . '/assets/css/faq.min.css', '', $nectar_theme_version );
  }
  if ( is_page('thank-you') ) {
    wp_enqueue_style( 'tlc-homepage-style', get_stylesheet_directory_uri() . '/assets/css/thank-you.min.css', '', $nectar_theme_version );
  }
  if ( is_home() || is_single() ) {
    wp_enqueue_style( 'tlc-blog-style', get_stylesheet_directory_uri() . '/assets/css/blog.min.css', '', $nectar_theme_version );
  }
  if (is_category() || is_tag()) {
    wp_enqueue_style( 'tlc-blog-category-style', get_stylesheet_directory_uri() . '/assets/css/blog-category.min.css', '', $nectar_theme_version );
  }
  if ( is_rtl() ) {
    wp_enqueue_style(  'salient-rtl',  get_template_directory_uri(). '/rtl.css', array(), '1', 'screen' );
  }
}

/**
 * Force Salient transparent header on the main blog index ("Posts page").
 *
 * Hook: nectar_activate_transparent_header
 * - Salient asks this filter whether the transparent header should be active.
 * - We return true on the blog index only.
 *
 * @param bool $active Current Salient decision about transparency.
 * @return bool        Updated decision.
 */
add_filter('nectar_activate_transparent_header', function($active) {
  if ( is_home() || is_single() ) {
    return true;
  }
  return $active;
});
add_filter('get_post_metadata', function($value, $object_id, $meta_key, $single) {
  if (!is_admin() && is_single() && $meta_key === '_force_transparent_header_color') {
    return $single ? 'dark' : array('dark');
  }
  return $value;
}, 10, 4);
add_action('nectar_hook_after_outer_wrap_open', function () {
  if (is_home()) {
    echo '<div class="container-wrap" style="padding-top: 0px; padding-bottom: 0px;"><div class="container main-content" role="header"><div class="row">' . do_shortcode('[nectar_global_section id="484"]') . '</div></div></div>';
  }

}, 20);


/**
 * Put WordPress blog posts under /blog/{post-slug}/
 *
 * What this does:
 * 1) Changes the permalink WordPress outputs for posts to /blog/{slug}/
 * 2) Adds a rewrite rule so /blog/{slug}/ loads the correct post
 * 3) (Optional) 301-redirects old post URLs to the new /blog/ URL to avoid duplicates
 *
 * After adding this file:
 * - Go to Settings → Permalinks → click "Save Changes" once to flush rewrite rules.
 *
 * Notes:
 * - This targets ONLY the built-in "post" post type.
 * - If you already use /blog/ for something else, this can conflict.
 */

/**
 * 1) Change generated permalinks for posts to use /blog/{post-slug}/
 */
add_filter('post_link', function (string $permalink, WP_Post $post): string {

    if ($post->post_type !== 'post') {
        return $permalink;
    }

    return home_url('/blog/' . $post->post_name . '/');

}, 10, 2);


/**
 * 2) Add rewrite rule so /blog/{slug}/ resolves to the correct post.
 *
 * IMPORTANT:
 * - This only adds the rule. WordPress will NOT start using it until you flush rules once.
 */
add_action('init', function (): void {

    // Matches: /blog/some-post/
    // Captures: some-post
    // Routes to: index.php?name=some-post
    add_rewrite_rule(
        '^blog/([^/]+)/?$',
        'index.php?name=$matches[1]',
        'top'
    );

}, 10);


/**
 * 3) Optional: 301 redirect old post URLs to /blog/{slug}/
 *
 * Why:
 * - Prevents duplicate content (same post accessible at multiple URLs).
 * - Helps keep SEO signals consolidated.
 *
 * If you do NOT want redirects, delete this block.
 */
add_action('template_redirect', function (): void {

    if (!is_singular('post')) {
        return;
    }

    $post = get_queried_object();
    if (!$post instanceof WP_Post) {
        return;
    }

    $target_url = home_url('/blog/' . $post->post_name . '/');

    // Current request URL without query string.
    $scheme      = is_ssl() ? 'https://' : 'http://';
    $host        = $_SERVER['HTTP_HOST'] ?? '';
    $request_uri = $_SERVER['REQUEST_URI'] ?? '';
    $current_url = $scheme . $host . $request_uri;
    $current_url = strtok($current_url, '?');

    // Compare paths so different domain aliases don’t cause loops.
    $current_path = untrailingslashit((string) parse_url($current_url, PHP_URL_PATH));
    $target_path  = untrailingslashit((string) parse_url($target_url, PHP_URL_PATH));

    if ($current_path !== $target_path) {
        wp_redirect($target_url, 301);
        exit;
    }

}, 10);

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
  if ( is_page('meet-our-team') ) {
    wp_enqueue_style( 'tlc-meet-our-team-style', get_stylesheet_directory_uri() . '/assets/css/meet-our-team.min.css', '', $nectar_theme_version );
  }
  if ( is_page('thank-you') ) {
    wp_enqueue_style( 'tlc-homepage-style', get_stylesheet_directory_uri() . '/assets/css/thank-you.min.css', '', $nectar_theme_version );
  }
  if (is_page('blog') || is_single() ) {
    wp_enqueue_style( 'tlc-blog-style', get_stylesheet_directory_uri() . '/assets/css/blog.min.css', '', $nectar_theme_version );
  }
  if ( is_page('book-a-free-tour') ) {
    wp_enqueue_style( 'tlc-forms-style', get_stylesheet_directory_uri() . '/assets/css/book-a-free-tour.min.css', '', $nectar_theme_version );
  }
  if ( is_rtl() ) {
    wp_enqueue_style(  'salient-rtl',  get_template_directory_uri(). '/rtl.css', array(), '1', 'screen' );
  }
}

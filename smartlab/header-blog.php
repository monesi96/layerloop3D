<?php
/**
 * Header per la sezione Blog/News — brand landing 2026.
 * Caricato con get_header('blog') da home.php, single.php, archive.php, search.php.
 */
$slb_home = home_url('/');
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Familjen+Grotesk:wght@400..700&family=Fragment+Mono&display=swap" rel="stylesheet">

<link rel="apple-touch-icon" sizes="180x180" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/apple-icon-180x180.png">
<link rel="icon" type="image/png" sizes="32x32" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/favicon-16x16.png">
<meta name="theme-color" content="#0E9F7E">

<title><?php echo esc_html( wp_get_document_title() ); ?></title>

<?php wp_head(); ?>

<!-- Stile blog — caricato dopo wp_head così vince sui CSS del vecchio tema -->
<link rel="stylesheet" href="<?php echo esc_url( get_template_directory_uri() ); ?>/css/blog.css?v=1.0">

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MHKKJCL');</script>
<!-- End Google Tag Manager -->
</head>
<body <?php body_class(); ?>>

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MHKKJCL"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<a class="skip" href="#main">Vai al contenuto</a>

<header class="top" id="topbar">
  <div class="wrap bar">
    <a class="logo" href="<?php echo esc_url( $slb_home ); ?>" aria-label="Smart Lab Industries — home">
      <img src="https://www.smartlab3d.com/wp-content/uploads/2026/07/logosmartlab.png" alt="Smart Lab Industries" class="logo-img">
    </a>
    <div class="nav-right">
      <nav class="pillnav" aria-label="Navigazione principale">
        <a href="<?php echo esc_url( $slb_home ); ?>#chi-siamo">Chi siamo</a>
        <a href="<?php echo esc_url( $slb_home ); ?>#processo">Processo</a>
        <a href="<?php echo esc_url( $slb_home ); ?>#prodotti">Case history</a>
        <a class="active" href="<?php echo esc_url( $slb_home . 'category/case-studies/' ); ?>">Blog</a>
        <a href="<?php echo esc_url( $slb_home ); ?>#contatti">Contatti</a>
      </nav>
      <a class="navbtn" style="color:#fff !important" href="<?php echo esc_url( $slb_home ); ?>#contatti">Consulenza</a>
      <button class="burger" id="burger" aria-expanded="false" aria-controls="sheet">Menu</button>
    </div>
  </div>
</header>

<nav class="sheet" id="sheet" aria-label="Menu mobile">
  <a href="<?php echo esc_url( $slb_home ); ?>#chi-siamo" style="--i:0">Chi siamo</a>
  <a href="<?php echo esc_url( $slb_home ); ?>#processo" style="--i:1">Processo</a>
  <a href="<?php echo esc_url( $slb_home ); ?>#prodotti" style="--i:2">Case history</a>
  <a href="<?php echo esc_url( $slb_home . 'category/case-studies/' ); ?>" style="--i:3">Blog</a>
  <a href="<?php echo esc_url( $slb_home ); ?>#contatti" style="--i:4">Contatti</a>
  <a class="mini" href="<?php echo esc_url( $slb_home ); ?>#contatti" style="--i:5; color:#fff !important">Prenota una consulenza →</a>
</nav>

<main id="main">

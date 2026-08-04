<!doctype html>
<html <?php language_attributes(); ?>>
<head>
<!-- Required meta tags -->
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<?php wp_head(); ?>

<!-- Bootstrap CSS -->
<!--link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.4.1/css/bootstrap.min.css" integrity="sha384-Vkoo8x4CGsO3+Hhxv8T/Q5PaXtkKtu6ug5TOeNV6gBiFeWPGFN9MuhOf23Q9Ifjh" crossorigin="anonymous"-->
<!--link rel="stylesheet" href="<?php echo esc_url( get_template_directory_uri() ); ?>/css/style.css"-->
<!--link rel="stylesheet" href="<?php echo esc_url( get_template_directory_uri() ); ?>/css/owl.carousel.css">
<link rel="stylesheet" href="<?php echo esc_url( get_template_directory_uri() ); ?>/fontasweone/css/all.css"-->


<link rel="apple-touch-icon" sizes="57x57" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/apple-icon-57x57.png">
<link rel="apple-touch-icon" sizes="60x60" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/apple-icon-60x60.png">
<link rel="apple-touch-icon" sizes="72x72" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/apple-icon-72x72.png">
<link rel="apple-touch-icon" sizes="76x76" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/apple-icon-76x76.png">
<link rel="apple-touch-icon" sizes="114x114" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/apple-icon-114x114.png">
<link rel="apple-touch-icon" sizes="120x120" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/apple-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/apple-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/apple-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/apple-icon-180x180.png">
<link rel="icon" type="image/png" sizes="192x192"  href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/android-icon-192x192.png">
<link rel="icon" type="image/png" sizes="32x32" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="96x96" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/favicon-96x96.png">
<link rel="icon" type="image/png" sizes="16x16" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/favicon-16x16.png">
<link rel="manifest" href="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/manifest.json">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="msapplication-TileImage" content="<?php echo esc_url( get_template_directory_uri() ); ?>/images/favicon/ms-icon-144x144.png">
<meta name="theme-color" content="#ffffff">

<title><?php the_title(); ?></title>

<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MHKKJCL');</script>
<!-- End Google Tag Manager -->

<!-- Global site tag (gtag.js) - Google Ads: 613395453 --> <script async src="https://www.googletagmanager.com/gtag/js?id=AW-613395453"></script> <script> window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'AW-613395453'); </script>

<!-- Event snippet for Website lead conversion page In your html page, add the snippet and call gtag_report_conversion when someone clicks on the chosen link or button. -->
<script> function gtag_report_conversion(url) { var callback = function () { if (typeof(url) != 'undefined') { window.location = url; } }; gtag('event', 'conversion', { 'send_to': 'AW-613395453/I192CLquyt0BEP3XvqQC', 'event_callback': callback }); return false; } </script>

</head>
<body>

<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-MHKKJCL"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<div class="top_header mb-2 p-1 text-center text-lg-right">
    <div class="container">
        <div class="row">
            <div class="col-12 langTp">
                <?php dynamic_sidebar( 'langTop' ); ?>
            </div>
        </div>
    </div>
</div>


<div class="top_menu mb-2 py-1">

    <div class="container">
        <div class="row">
            <div class="col-md-3 py-2">
                <a href="<?php echo site_url(); ?>">
                    <img src="<?php echo esc_url( get_template_directory_uri() ); ?>/images/logo-smartlab.svg" alt="" class="logoSmartLab">
                </a>
            </div>
            <div class="col-md-9">
                <nav class="navbar navbar-expand-lg navbar-light">
                    <button class="navbar-toggler mt-3 mx-auto" type="button" data-toggle="collapse" data-target="#menuPrinc" aria-controls="menuPrinc" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                    </button>

                    <?php

                    $argMenu = array(
                        'menu' => 'Principale',
                        'container_class' => 'collapse navbar-collapse menuPrc',
                        'container_id'    => 'menuPrinc',
                        'menu_class'      => 'navbar-nav mx-auto',
                        'fallback_cb'     => 'bs4navwalker::fallback',
                        'walker'          => new bs4navwalker()
                    );

                    wp_nav_menu($argMenu);

                    ?>
                </nav>
            </div>
        </div>
    </div>

</div>

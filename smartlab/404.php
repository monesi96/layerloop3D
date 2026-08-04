<?php get_header(); ?>

<div class="container">
    <div class="row">
        <div class="col-md-12 my-3">
            <?php
            if ( function_exists('yoast_breadcrumb') ) {
            yoast_breadcrumb( '<ol class="breadcrumb2">','</ol>' );
            }
            ?>
        </div>
    </div>
    <div class="row mb-3">
        <div class="col-md-8 border-right">
            <h1 class="tltPageNews"><?php the_title(); ?></h1>
            <div class="contPage">
                <?php
                    _e( 'Oops! That page can&rsquo;t be found.', 'smartlab' );
                ?>
            </div>
        </div>
        <div class="col-md-4 sidebarDX">
            <?php dynamic_sidebar( 'sidebarDX' ); ?>
        </div>
    </div>
</div>

<?php get_footer(); ?>

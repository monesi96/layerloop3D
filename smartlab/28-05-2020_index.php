<?php get_header(); ?>

<div class="container">
    <div class="row">
        <div class="col-md-12">
            <?php
            if ( function_exists('yoast_breadcrumb') ) {
            yoast_breadcrumb( '<ol class="breadcrumb2">','</ol>' );
            }
            ?>
        </div>
    </div>
    <div class="row">
        <div class="col-12">
            <h1 class="tltPageNews"><?php the_title(); ?></h1>
            <div class="contPage">
                <?php
                if (have_posts()) : while (have_posts()) : the_post();
                    the_content();
                endwhile;
                endif;
                ?>
            </div>
        </div>
    </div>
</div>

<?php get_footer(); ?>

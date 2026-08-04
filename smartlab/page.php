<?php get_header(); ?>

<div class="container">
    <div class="row my-2">
        <div class="col-md-6">
            <?php
            if ( function_exists('yoast_breadcrumb') ) {
            yoast_breadcrumb( '<ol class="breadcrumb2">','</ol>' );
            }
            ?>
        </div>
        <div class="col-md-6">
            <h1 class="tltPage"><?php the_title(); ?></h1>
        </div>
    </div>
    <div class="row">
        <div class="col-md-12">
            <div class="contPage mt-3">
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

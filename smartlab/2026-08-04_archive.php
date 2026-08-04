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
            <div class="contPage">
                <?php if ( have_posts() ) : while ( have_posts() ) : the_post(); ?>
                <div class="row">
                    <div class="col-md-12">
                        <?php
                        if (has_post_thumbnail()):
                        $attr = array(
                            'class'	=> "img-fluid border rounded p-1 mb-2"
                        );
                        ?>
                        <a href="<?php the_permalink(); ?>" class="titleHC"><?php the_post_thumbnail( 'large', $attr ); ?></a>
                        <!--a href="<?php the_permalink(); ?>" class="titleHC"><img src="https://via.placeholder.com/640x480" alt="" class="img-fluid"></a-->
                        <?php endif; ?>
                        <h2 class="tltPageNews"><?php the_title(); ?></h2>
                        <?php
                        $content = get_the_content();
                        $trimmed_content = wp_trim_words($content, 90, '...<br /><br /><a href="'. get_permalink() .'" class="boxButtonPg2">'.__('Read more').'</a><br /><br />' );
                        echo $trimmed_content;
                        ?>
                    </div>
                </div>
                <?php endwhile; ?>
                <div class="my-1 mx-auto">
                    <?php
                    the_posts_pagination(
                        array(
                            'prev_text'          => 'Precedente',
                            'next_text'          => 'Successivo',
                            'screen_reader_text' => __( '&nbsp;' ),
                            'aria_label' => ''
                        )
                    );
                    ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
        <div class="col-md-4 sidebarDX">
            <?php dynamic_sidebar( 'sidebarDX' ); ?>
        </div>
    </div>
</div>

<?php get_footer(); ?>

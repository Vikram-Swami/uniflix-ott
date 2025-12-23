import { sliderData, nfPost } from "../utils/sliderData";
import LazyMovieRow from '../components/LazyMovieRow';
import HeroSlider from '../components/HeroSlider';

export default function Home() {
    return (
        <div>
            <div className="min-h-screen">
                {/* Hero Slider */}
                {sliderData?.homeData && (
                    <HeroSlider slides={sliderData.homeData} />
                )}

                {/* Movie Rows with Lazy Loading */}
                <div className="pb-16">
                    {nfPost?.map((row, index) => (
                        <LazyMovieRow
                            key={index}
                            title={row.cate}
                            movieIds={row.ids}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}

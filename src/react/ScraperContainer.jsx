import SingleScraper from './SingleScraper';

export default function ScraperContainer({ scrapers }) {
    return (
        <div>
            {scrapers.map((scraper) => (
                <SingleScraper scraper={scraper} />
            ))}
        </div>
    );
}

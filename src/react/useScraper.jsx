import { useCallback, useEffect, useReducer } from 'react';

export default function useScraper(localStorageKey) {
    const scraperReducer = useCallback((state, action) => {
        let nextState = [...state];
        if (action.name === 'add') {
            nextState.push(action.scraper);
        } else if (action.name === 'remove') {
            nextState.splice(action.index, 1);
        } else if (action.name === 'set') {
            nextState = [...action.scrapers];
        }

        localStorage.setItem(localStorageKey, JSON.stringify(nextState));

        return nextState;
    }, []);

    const [scrapers, dispatch] = useReducer(scraperReducer, []);

    const addScraper = useCallback((scraper) => dispatch({ name: 'add', scraper }), [dispatch]);
    const removeScraper = useCallback((index) => dispatch({ name: 'remove', index }), [dispatch]);
    const setScrapers = useCallback((scrapers) => dispatch({ name: 'set', scrapers }), [dispatch]);

    useEffect(() => {
        const localStorageScrapers = JSON.parse(localStorage.getItem(localStorageKey)) || [];
        setScrapers(localStorageScrapers);
    }, []);

    return [scrapers, { addScraper, removeScraper }];
}

import React from 'react';
import "../CategoryPage/CategoryPageFooter.css";
import amazon_logo__origin from "../../Assets/amazon_logo__origin.png";
import LanguageIcon from '@mui/icons-material/Language';
import vietnam from '../../Assets/vietnam.png';
import vietnam_currency from '../../Assets/vietnam_currency.png'

const ProductFooter = () => {
    return (
        <div className="product_footer">
            {/* footer trên */}
            <div className="footer__up">
                <div className="footer__up__box">
                    <div className="footer__up__box__text">
                        <div className="footer__up__box__cover">
                            {/* block 1 */}
                            <div>
                                <h3 className="footer__up__box__text__header">
                                    Get To Know Us
                                </h3>
                                <ul className="footer__up__box__text__lines">
                                    <li className="footer__up__box__text__lines__link">
                                        Careers
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Blog
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        About Amazon
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Investor Relations
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Amazon Devices
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Amazon Science
                                    </li>
                                </ul>
                            </div>

                            {/* block 2 */}
                            <div>
                                <h3 className="footer__up__box__text__header">
                                    Make Money with Us
                                </h3>
                                <ul className="footer__up__box__text__lines">
                                    <li className="footer__up__box__text__lines__link">
                                        Sell products on Amazon
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Sell on Amazon Business
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Sell apps on Amazon
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Become an Affiliate
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Advertise Your Products
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Self-Publish with Us
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Host an Amazon Hub
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        See More Make Money with Us
                                    </li>
                                </ul>
                            </div>

                            {/* block 3 */}
                            <div>
                                <h3 className="footer__up__box__text__header">
                                    Amazon Payment Products
                                </h3>
                                <ul className="footer__up__box__text__lines">
                                    <li className="footer__up__box__text__lines__link">
                                        Amazon Business Card
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Shop with Points
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Reload Your Balance
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Amazon Currency Converter
                                    </li>
                                </ul>
                            </div>

                            {/* block 4 */}
                            <div>
                                <h3 className="footer__up__box__text__header">
                                    Let Us Help You
                                </h3>
                                <ul className="footer__up__box__text__lines">
                                    <li className="footer__up__box__text__lines__link">
                                        Amazon and COVID-19
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Your Account
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Your Orders
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Shipping Rates & Policies
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Returns & Replacements
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Manage Your Content and Devices
                                    </li>
                                    <li className="footer__up__box__text__lines__link">
                                        Help
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer__logo">
                    {/* logo amazon */}
                    <div>
                        <img className="footer__amazon__logo" src={amazon_logo__origin} alt='amazon_logo' />
                    </div>

                    {/* ngôn ngữ */}
                    <div className="logo__title">
                        <p className="logo__title__text">
                            <span>
                                <LanguageIcon />
                            </span>
                            English
                        </p>
                    </div>

                    {/* tiền tệ */}
                    <div className="currency">
                        <img src={vietnam_currency} className="footer__vietnam__currency" alt="vietnam_currency" />
                        <p>
                            VND - Vietnamese Dong
                        </p>
                    </div>

                    {/* quóc kì */}
                    <div className="footer__flag">
                        <img src={vietnam} className="footer__vietnam__flag" alt="vietnam_logo" />
                        <p>
                            Viet Nam
                        </p>
                    </div>
                </div>
            </div>

            {/* footer dưới */}
            <div className="footer__down">
                <div className="footer__down__box">
                    <div className="footer__down__box__text">
                        <div className="footer__down__box__cover">
                            {/* block 1 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Amazon Music
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Stream millions of songs
                                    </li>
                                </ul>
                            </div>

                            {/* block 2 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Amazon Ads
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Reach customers wherever they spend their time
                                    </li>
                                </ul>
                            </div>

                            {/* block 3 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    6pm
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Score deals on fashion brands
                                    </li>
                                </ul>
                            </div>

                            {/* block 4 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    AbeBooks
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Books, art & collectibles
                                    </li>
                                </ul>
                            </div>

                            {/* block 5 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    ACX
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Audiobook Publishing Made Easy
                                    </li>
                                </ul>
                            </div>

                            {/* block 6 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Sell on Amazon
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Start a Selling Account
                                    </li>
                                </ul>
                            </div>

                            {/* block 7 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Veeqo
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Shipping Software Inventory Management
                                    </li>
                                </ul>
                            </div>

                            {/* block 8 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Amazon Business
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Everything For Your Business
                                    </li>
                                </ul>
                            </div>

                            {/* block 9 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    AmazonGlobal
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Ship Orders Internationally
                                    </li>
                                </ul>
                            </div>

                            {/* block 10 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Home Services
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Experienced Pros Happiness Guarantee
                                    </li>
                                </ul>
                            </div>

                            {/* block 11 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Amazon Web Services
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Scalable Cloud Computing Services
                                    </li>
                                </ul>
                            </div>

                            {/* block 12 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Audible
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Listen to Books & Original Audio Performances
                                    </li>
                                </ul>
                            </div>

                            {/* block 13 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Box Office Mojo
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Find Movie Box Office Data
                                    </li>
                                </ul>
                            </div>

                            {/* block 14 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Goodreads
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Book reviews & recommendations
                                    </li>
                                </ul>
                            </div>

                            {/* block 15 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    IMDb
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Movies, TV & Celebrities
                                    </li>
                                </ul>
                            </div>

                            {/* block 16 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    IMDbPro
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Get Info Entertainment Professionals Need
                                    </li>
                                </ul>
                            </div>

                            {/* block 17 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Kindle Direct Publishing
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Indie Digital & Print Publishing Made Easy
                                    </li>
                                </ul>
                            </div>

                            {/* block 18 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Prime Video Direct
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Video Distribution Made Easy
                                    </li>
                                </ul>
                            </div>

                            {/* block 19 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Shopbop
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Designer Fashion Brands
                                    </li>
                                </ul>
                            </div>

                            {/* block 20 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Woot!
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Deals and Shenanigans
                                    </li>
                                </ul>
                            </div>

                            {/* block 21 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Zappos
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Shoes & Clothing
                                    </li>
                                </ul>
                            </div>

                            {/* block 22 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Ring
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Smart Home Security Systems
                                    </li>
                                </ul>
                            </div>

                            {/* block 23 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    eero WiFi
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Stream 4K Video in Every Room
                                    </li>
                                </ul>
                            </div>

                            {/* block 24 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Blink
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Smart Security for Every Home
                                    </li>
                                </ul>
                            </div>

                            {/* block 25 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Neighbors App
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Real-Time Crime & Safety Alerts
                                    </li>
                                </ul>
                            </div>

                            {/* block 26 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Amazon Subscription Boxes
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Top subscription boxes – right to your door
                                    </li>
                                </ul>
                            </div>

                            {/* block 27 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    PillPack
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Pharmacy Simplified
                                    </li>
                                </ul>
                            </div>

                            {/* block 28 */}
                            <div className="footer__down__block">
                                <h3 className="footer__down__box__text__header">
                                    Amazon Luna
                                </h3>
                                <ul className="footer__down__box__text__lines">
                                    <li className="footer__down__box__text__lines__link">
                                        Video games from the cloud, no console required
                                    </li>
                                </ul>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="footer__bottom">
                    <div className="footer__bottom__up">
                        <ul className="footer__bottom__up__block">
                            <li className="footer__bottom__up__text">
                                Conditions of Use
                            </li>
                            <li className="footer__bottom__up__text">
                                Privacy Notice
                            </li>
                            <li className="footer__bottom__up__text">
                                Consumer Health Data Privacy Disclosure
                            </li>
                            <li className="footer__bottom__up__text">
                                Your Ads Privacy Choices
                            </li>
                        </ul>
                    </div>
                    <div className="footer__bottom__down">
                        <p className="footer__bottom__down__text">
                            © 1996 - 2024, Amazon.com, Inc, or its affiliates
                        </p>
                    </div>
                </div>
            </div>

        </div>
    )
}

export default ProductFooter
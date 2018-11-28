import * as React from 'react';
import {autobind} from '@shopify/javascript-utilities/decorators';
import TextField from '../TextField';
import Icon from '../Icon';
import TextStyle from '../TextStyle';
import ActionList, {Props as ActionListProps} from '../ActionList';
import * as styles from './ShopSwitcher.scss';

interface Shop {
  url: string;
  name: string;
}

export interface BaseProps {
  shops: Shop[];
  searchPlaceholder: string;
  activeIndex: number;
  noResultsMessage: string;
}

export interface Props extends BaseProps {
  children(
    searchField: React.ReactNode,
    content: React.ReactNode,
  ): React.ReactNode;
}

interface State {
  query: string;
  items: ActionListProps['items'];
}

const MIN_SHOPS_FOR_SEARCH = 5;

class ShopSwitcher extends React.Component<Props, State> {
  state = {
    query: '',
    items: transformShopsToItems(this.props.shops, this.props.activeIndex),
  };

  render() {
    const {query, items} = this.state;
    const {searchPlaceholder, shops, children, noResultsMessage} = this.props;

    const searchFieldMarkup = shops.length >= MIN_SHOPS_FOR_SEARCH && (
      <div className={styles.Search}>
        <TextField
          labelHidden
          label=""
          value={query}
          onChange={this.handleQueryChange}
          prefix={<Icon source="search" color="inkLightest" />}
          placeholder={searchPlaceholder}
        />
      </div>
    );

    const shopsListMarkup = (
      <section className={styles.ShopsList}>
        <ActionList items={items} />
      </section>
    );

    const contentMarkup =
      query && items.length < 1 ? (
        <div className={styles.NoResults}>
          <TextStyle variation="subdued">{noResultsMessage}</TextStyle>
        </div>
      ) : (
        shopsListMarkup
      );

    return children(searchFieldMarkup, contentMarkup);
  }

  @autobind
  private handleQueryChange(query: string) {
    const {shops, activeIndex} = this.props;
    this.setState({query, items: filterShops(query, shops, activeIndex)});
  }
}

function filterShops(query: string, shops: Shop[], activeIndex: number) {
  const lowerQuery = query.toLowerCase();
  const newShops = shops.filter(
    ({name, url}) =>
      name.toLowerCase().startsWith(lowerQuery) ||
      cleanUrl(url).startsWith(lowerQuery),
  );
  return transformShopsToItems(newShops, activeIndex);
}

function transformShopsToItems(shops: Shop[], activeIndex: number) {
  return shops.map(({name, url}, index) => ({
    content: (
      <div className={styles.ShopItem}>
        <div className={styles.ShopName}>{name}</div>
        <div className={styles.ShopUrl}>
          <TextStyle variation="subdued">{cleanUrl(url)}</TextStyle>
        </div>
      </div>
    ) as any,
    url,
    active: index === activeIndex,
  }));
}

function cleanUrl(url: string) {
  return url.replace(/https?:\/\//, '');
}

export default ShopSwitcher;

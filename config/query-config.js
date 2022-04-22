exports.portfolioHoldings = (transactions) => {
  return transactions.reduce((holdings, transaction) => {
    const target = holdings.find((el) => el.ticker === transaction.ticker);
    if (target) {
      target.shares += transaction.share_change;
      target.total += transaction.total;
    } else {
      holdings.push({ ticker: transaction.ticker, shares: transaction.share_change, total: transaction.total });
    }
    return holdings;
  }, []);
};

exports.portfolioCostBasis = (transactions) => transactions.reduce((sum, t) => sum + t.total, 0);

exports.portfolioValue = (holdings) => holdings.reduce((sum, h) => sum + h.shares * h.current_price, 0);

exports.dailyChange = (holdings) => holdings.reduce((sum, h) => sum + h.shares * h.day_change, 0);

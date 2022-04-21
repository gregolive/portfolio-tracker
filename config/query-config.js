exports.portfolioHoldings = (transactions) => {
  const holdings = transactions.reduce((holdings, transaction) => {
    const target = holdings.find((el) => el.ticker === transaction.ticker);
    if (target) {
      target.shares += transaction.shares;
      target.total += transaction.total;
    } else {
      holdings.push({ ticker: transaction.ticker, shares: transaction.shares, total: transaction.total });
    }
    return holdings;
  }, []);
  return holdings.sort((a, b) => b.total - a.total);
};

exports.portfolioCostBasis = (transactions) => transactions.reduce((sum, t) => sum + t.total, 0);

exports.portfolioValue = (holdings) => holdings.reduce((sum, h) => sum + h.shares * h.current_price, 0);

exports.dailyChange = (holdings) => holdings.reduce((sum, h) => sum + h.shares * h.day_change, 0);

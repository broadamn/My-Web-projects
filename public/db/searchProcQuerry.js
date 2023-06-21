export const createProcQuery = `
CREATE PROCEDURE FindTrainOptions(IN pOrigin VARCHAR(255), IN pDestination VARCHAR(255), IN minprice INT, IN maxprice INT, IN pType VARCHAR(5))
BEGIN
  IF pType = 'any' THEN
    SELECT *
    FROM journey
    WHERE origin LIKE pOrigin AND destination LIKE pDestination AND price >= minprice AND price <= maxprice;
  ELSE
    SELECT *
    FROM journey
    WHERE origin LIKE pOrigin AND destination LIKE pDestination AND price >= minprice AND price <= maxprice AND type = pType;
  END IF;

  SELECT j1.origin, j1.destination as dest1, j2.departure_time as ttime, j2.destination as dest2, 1 AS transfers, j1.price + j2.price AS price, j1.departure_time as dtime,
    j2.arrival_time as atime
  FROM journey j1
  JOIN journey j2 ON j1.destination = j2.origin
  WHERE j1.origin LIKE pOrigin AND j2.destination LIKE pDestination
    AND j1.arrival_time < j2.departure_time
    AND j1.origin <> j2.destination
    AND j1.price + j2.price >= minprice
    AND j1.price + j2.price <= maxprice
    AND (j1.type = pType OR pType = 'any');

  SELECT j1.origin, j1.destination as dest1, j2.destination as dest2, j3.destination as dest3, 2 AS transfers, j1.departure_time as dtime, j3.arrival_time as atime, j1.price + j2.price + j3.price AS price
  FROM journey j1
  JOIN journey j2 ON j1.destination = j2.origin
  JOIN journey j3 ON j2.destination = j3.origin
  WHERE j1.origin LIKE pOrigin
    AND j3.destination LIKE pDestination
    AND j1.arrival_time < j2.departure_time
    AND j2.arrival_time < j3.departure_time
    AND j1.origin <> j2.destination
    AND j2.origin <> j3.destination
    AND j1.price + j2.price + j3.price >= minprice
    AND j1.price + j2.price + j3.price <= maxprice
    AND (j1.type = pType OR pType = 'any');
      
END
`;

export const dropProcQuery = 'DROP PROCEDURE IF EXISTS FindTrainOptions;';

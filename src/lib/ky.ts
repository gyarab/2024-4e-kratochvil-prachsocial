import ky from "ky";

/**
 * Instance HTTP klienta ky s nastavenym vlastnim JSON parserem
 *
 * Automaticky konvertuje vsechny property, ktere konci na "At" (napr. createdAt)
 * na objekty typu Date pro jednodussi praci s datumy
 */

const kyInstance = ky.create({
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      // Vsechny klice koncici na "At" (napr. createdAt, updatedAt) prevedeme na Date objekty
      if (key.endsWith("At")) return new Date(value);
      return value;
    }),
});

export default kyInstance;

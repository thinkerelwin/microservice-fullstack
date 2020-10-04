import axios from "axios";
import { useState } from "react";

export function UseRequest({ url, method, body, onSuccess }) {
  const [errors, setErrors] = useState(null);

  async function fetch() {
    try {
      const response = await axios[method](url, body);
      setErrors(null);
      if (onSuccess) {
        onSuccess(response.data);
      }
      return response.data;
    } catch (error) {
      setErrors(
        <div className="alert alert-danger">
          <h4>Oops...</h4>
          <ul className="errors-list">
            {error.response.data.errors.map((err) => (
              <li key={err.message}>{err.message}</li>
            ))}
          </ul>
        </div>
      );
    }
  }

  return { fetch, errors };
}
